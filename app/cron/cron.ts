import cron from 'node-cron';
import { supabase } from '@/lib/supabaseClient'; // Assure-toi que supabaseClient est correctement configuré.
import { Resend } from 'resend';

// Initialisation de Resend avec ta clé API
const resend = new Resend(process.env.RESEND_API_KEY);

// Fonction pour envoyer les emails programmés
const sendScheduledEmails = async () => {
    try {
        // Récupérer les emails planifiés dont la date et l'heure sont arrivées
        const { data: emails, error } = await supabase
            .from('scheduled_emails')
            .select('*')
            .lt('scheduled_datetime', new Date().toISOString())
            .eq('status', 'scheduled'); // Assure-toi que l'email est bien en statut "scheduled"

        if (error) {
            console.error('❌ Erreur lors de la récupération des emails planifiés:', error);
            return;
        }

        // Envoi des emails
        for (const email of emails) {
            try {
                const { recipients, sender_name, sender_email, subject, email_body } = email;

                // Envoi via Resend
                const response = await resend.emails.send({
                    from: sender_email,
                    to: recipients,
                    subject,
                    html: email_body,
                });

                // Mise à jour du statut de l'email à 'sent'
                const { error: updateError } = await supabase
                    .from('scheduled_emails')
                    .update({ status: 'sent' })
                    .eq('id', email.id);

                if (updateError) {
                    console.error('❌ Erreur lors de la mise à jour du statut de l\'email:', updateError);
                } else {
                    console.log(`📬 Email envoyé à ${recipients} avec succès !`);
                }
            } catch (sendError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email:', sendError);
            }
        }
    } catch (err) {
        console.error('❌ Erreur lors de la récupération des emails planifiés:', err);
    }
};

// Planifier le cron job pour s'exécuter toutes les minutes (ou ajuster la fréquence selon les besoins)
cron.schedule('* * * * *', sendScheduledEmails); // Exécution toutes les minutes

console.log('Cron job pour envoyer les emails planifiés activé !');