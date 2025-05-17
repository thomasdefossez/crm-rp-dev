// pages/api/stancer/create-payment.ts  (ligne 1)
import type { NextApiRequest, NextApiResponse } from "next";                    // 2
import { Payment } from "stancer";                                              // 3

type Data =                                                                     // 5
    | { paymentId: string; paymentUrl: string }                                  // 6
    | { error: string };                                                          // 7

export default async function handler(                                         // 9
    req: NextApiRequest,                                                          // 10
    res: NextApiResponse<Data>                                                    // 11
) {                                                                             // 12
    if (req.method !== "POST") {                                                  // 13
        res.status(405).json({ error: "Method Not Allowed" });                      // 14
        return;                                                                    // 15
    }                                                                             // 16

    const { amount, currency } = req.body as { amount?: number; currency?: string };  // 18

    if (!amount || !currency) {                                                   // 20
        res.status(400).json({ error: "Missing amount or currency" });              // 21
        return;                                                                    // 22
    }                                                                             // 23

    try {                                                                         // 25
        const payment = new Payment();                                              // 26
        payment.amount = amount; // ex: 1000 = 10.00 EUR                            // 27
        payment.currency = currency; // ex: 'EUR'                                  // 28
        await payment.create();                                                     // 29

        res.status(200).json({ paymentId: payment.id, paymentUrl: payment.url });  // 31
    } catch (error) {                                                             // 32
        console.error(error);                                                       // 33
        res.status(500).json({ error: "Internal Server Error" });                   // 34
    }                                                                             // 35
}                                                                               // 36