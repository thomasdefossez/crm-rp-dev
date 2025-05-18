'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Send, User, TrendingUp, MousePointer, Settings, Link2 as LinkIcon } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePathname } from "next/navigation"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cegraph } from "@/components/ui/cegraph";

export default function ContactsPage() {
   
    // Suppression de l'useEffect avec setInterval pour ajout de données simulées

    const [refreshCounter, setRefreshCounter] = useState(0);
    const [totalContacts, setTotalContacts] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const dialogTriggerRef = useRef<HTMLButtonElement>(null);
    const [selectedLists, setSelectedLists] = useState<number[]>([]);
    const [totalRecipients, setTotalRecipients] = useState(0);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [recentContacts, setRecentContacts] = useState<any[]>([]);
    const [totalEmails, setTotalEmails] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [emailsPerPage] = useState<number>(10);
    const router = useRouter();

    const [totalSent, setTotalSent] = useState(0);
    const [totalRecipientsCount, setTotalRecipientsCount] = useState(0);
    const [averageOpenRate, setAverageOpenRate] = useState(0);
    const [averageClickRate, setAverageClickRate] = useState(0);
    const [averageClickThroughRate, setAverageClickThroughRate] = useState(0);

    const [currentMonthEmails, setCurrentMonthEmails] = useState(0);
    const [monthVariation, setMonthVariation] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            const { count, error } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
            if (!error && count !== null) setTotalContacts(count);
        };
        fetchCount();
    }, [refreshCounter]);

    useEffect(() => {
        const fetchEmails = async () => {
            const { data, error, count } = await supabase
                .from('emails')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((currentPage - 1) * emailsPerPage, currentPage * emailsPerPage - 1);
            if (!error && data) {
                // fetch email_open_events
                const { data: allOpens } = await supabase.from('email_open_events').select('*');
                const opensByEmailId = allOpens?.reduce((acc: Record<string, number>, event) => {
                  if (event.email_id) {
                    acc[event.email_id] = (acc[event.email_id] || 0) + 1;
                  }
                  return acc;
                }, {}) || {};

                const enrichedData = data.map((email) => {
                  const parsedTo = typeof email.to === 'string' ? JSON.parse(email.to) : email.to;
                  const totalRecipients = Array.isArray(parsedTo) ? parsedTo.length : 0;
                  const openCount = opensByEmailId[email.id] || 0;
                  return {
                    ...email,
                    to: parsedTo,
                    open_count: openCount,
                    open_rate: totalRecipients > 0 ? Math.round((openCount / totalRecipients) * 100) : 0,
                    click_count: email.click_count || 0,
                    click_rate: totalRecipients > 0 && email.click_count
                      ? Math.round((email.click_count / totalRecipients) * 100)
                      : 0,
                  };
                });

                setRecentContacts(enrichedData);
                setTotalEmails(count || 0);

                const sent = enrichedData.length;
                const recipients = enrichedData.reduce((acc, email) => {
                  try {
                    return acc + (Array.isArray(email.to) ? email.to.length : 0);
                  } catch {
                    return acc;
                  }
                }, 0);
                // On utilise les nouveaux champs enrichis pour les stats
                const openSum = enrichedData.reduce((acc, email) => acc + (email.open_rate || 0), 0);
                const clickSum = enrichedData.reduce((acc, email) => acc + (email.click_rate || 0), 0);
                const ctrSum = enrichedData.reduce((acc, email) => acc + (email.click_through_rate || 0), 0);

                // Ajout: calcul dynamique du taux d'ouverture réel
                const totalOpens = allOpens?.length || 0;
                const openRateCalculated = recipients > 0 ? Math.round((totalOpens / recipients) * 100) : 0;

                setTotalSent(sent);
                setTotalRecipientsCount(recipients);
                setAverageOpenRate(openRateCalculated);
                setAverageClickRate(sent ? Math.round(clickSum / sent) : 0);
                setAverageClickThroughRate(sent ? Math.round(ctrSum / sent) : 0);
            }

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

            const { count: countCurrentMonth } = await supabase
              .from('emails')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', startOfMonth);

            const { count: countPreviousMonth } = await supabase
              .from('emails')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', startOfPrevMonth)
              .lte('created_at', endOfPrevMonth);

            const currentCount = typeof countCurrentMonth === 'number' ? countCurrentMonth : 0;
            const previousCount = typeof countPreviousMonth === 'number' ? countPreviousMonth : 0;

            setCurrentMonthEmails(currentCount);
            const variation = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;
            setMonthVariation(Math.round(variation));
        };
        fetchEmails();
    }, [currentPage]);

    const handleCreateList = async (listName: string) => {
        const { error } = await supabase.from('lists').insert([{ name: listName }]);
        if (error) toast.error('Erreur lors de la création de la liste');
        else {
            toast.success('Liste créée avec succès !');
            setRefreshCounter((c) => c + 1);
            dialogTriggerRef.current?.click();
        }
    };

    const pathname = usePathname();
    return (
      <SidebarProvider>
        {/* Sidebar with dynamic highlight */}
        <AppSidebar>
          <nav className="space-y-2 px-6 py-4 text-sm text-muted-foreground">
            <div className="font-semibold text-muted-foreground mb-4">Navigation</div>
            <Link href="/dashboard" className={pathname === '/dashboard' ? 'text-primary font-semibold' : 'hover:text-primary'}>
              Tableau de bord
            </Link>
            <Link href="/emails" className={pathname === '/emails' ? 'text-primary font-semibold' : 'hover:text-primary'}>
              Campagnes
            </Link>
            <Link href="/emails/stats" className={pathname === '/emails/stats' ? 'text-primary font-semibold' : 'hover:text-primary'}>
              Statistiques
            </Link>
          </nav>
        </AppSidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/emails">Emails</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="p-4">
            <div className="flex items-end justify-between px-8 border-b pb-4">

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-sm text-muted-foreground">
                  <Settings className="mr-2 h-4 w-4" /> Augmenter le quota
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Link href="/emails">
                      <Button ref={dialogTriggerRef} size="sm">Envoyer un email</Button>
                    </Link>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* Bloc Statistiques */}
            <div className="p-8">
              <div className="bg-white p-6 rounded-lg border border-muted">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Send className="text-primary h-5 w-5" />
                      <span>Emails sent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-foreground">{totalSent}</div>
                      <div className="text-xs text-muted-foreground flex flex-col">
                        <span>{currentMonthEmails} ce mois-ci</span>
                        <span className={`${monthVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {monthVariation >= 0 ? '+' : ''}{monthVariation}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <User className="text-primary h-5 w-5" />
                      <span>Recipients</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{totalRecipientsCount}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <TrendingUp className="text-primary h-5 w-5" />
                      <span>Open rate</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{averageOpenRate}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <MousePointer className="text-primary h-5 w-5" />
                      <span>Click rate</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{averageClickRate}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <LinkIcon className="text-primary h-5 w-5" />
                      <span>Click through rate</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{averageClickThroughRate}%</div>
                  </div>
                </div>
                <button className="mt-6 text-sm font-medium text-primary hover:underline">Show more →</button>
              </div>

          
            
              {/* Tableau Emails récents */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-6 overflow-x-auto">
                <div className="p-4">
                  <h2 className="text-lg font-semibold">Emails récents</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Sujet</TableHead>
                      <TableHead className="whitespace-nowrap">Statut</TableHead>
                      <TableHead className="whitespace-nowrap">Destinataires</TableHead>
                      <TableHead className="whitespace-nowrap">Ouvertures</TableHead>
                      <TableHead className="whitespace-nowrap">Clics</TableHead>
                      <TableHead className="whitespace-nowrap">Date d'envoi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentContacts.length > 0 ? recentContacts.map((email) => {
                      const formattedDate = email.created_at
                        ? new Date(email.created_at).toLocaleString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })
                        : 'N/A';
                      return (
                        <TableRow key={email.id}>
                          <TableCell>
                            <Link href={`/clients/${email.id}`} className="text-sm font-medium text-primary hover:underline">
                              {email.subject || 'N/A'}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">{email.status}</TableCell>
                          <TableCell className="text-sm">{Array.isArray(email.to) ? email.to.join(', ') : 'N/A'}</TableCell>
                          <TableCell className="text-sm">
                            {typeof email.open_rate === 'number' ? `${email.open_rate}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {typeof email.click_rate === 'number' ? `${email.click_rate}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-sm">{formattedDate}</TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm">
                          Aucun email trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center p-4 border-t">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="text-sm text-muted-foreground hover:text-primary"
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} sur {Math.ceil(totalEmails / emailsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalEmails / emailsPerPage)))}
                    className="text-sm text-muted-foreground hover:text-primary"
                    disabled={currentPage === Math.ceil(totalEmails / emailsPerPage) || Math.ceil(totalEmails / emailsPerPage) === 0}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
}

async function sendEmail({
    senderName,
    senderEmail,
    subject,
    emailBody,
    recipients,
}: {
    senderName: string;
    senderEmail: string;
    subject: string;
    emailBody: string;
    recipients: { email: string }[];
}) {
    try {
        const toEmails = recipients.map((r) => r.email);
        console.log('Envoi email à :', toEmails);
        console.log('Sujet :', subject);
        console.log('Expéditeur :', senderName, senderEmail);
        console.log('Contenu :', emailBody);
        toast.success('Email envoyé avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        toast.error('Erreur lors de l\'envoi de l\'email.');
    }
}
