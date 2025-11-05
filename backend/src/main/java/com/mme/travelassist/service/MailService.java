package com.mme.travelassist.service;

import jakarta.mail.MessagingException;

public interface MailService {

    /**
     * Sends an email message with the specified recipient, subject, and HTML body.
     * @param recipient Recipient's email address.
     * @param subject Subject of the email.
     * @param htmlBody the HTML page containing the email body.
     * @throws MessagingException if there is an error in sending the email.
     */
    public void sendMessage(String recipient, String subject, String htmlBody) throws MessagingException;


        /**
         * Sends an email with a generated password.
         * @param recipient Recipient's email address.
         * @param generatedPassword The generated password to be sent.
         * @throws MessagingException If there is an error sending the email.
         */
    void sendGeneratedPasswordEmail(String recipient, String generatedPassword) throws MessagingException;
}
