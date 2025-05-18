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
  // ... [le reste du code ne change pas]
}

type Recipient = {
  email: string;
  [key: string]: any;
};

async function sendEmail({ senderName, senderEmail, subject, emailBody, recipients }: {
  senderName: string;
  senderEmail: string;
  subject: string;
  emailBody: string;
  recipients: Recipient[];
}) {
  const toEmails = recipients.map((r) => r.email);
  console.log("Envoi vers :", toEmails);
  toast.success('Email envoyé avec succès !');
}