package com.mme.travelassist.service;

import com.mme.travelassist.model.enums.Language;
import jakarta.mail.MessagingException;

public interface MailService {

    /**
     * Sends an email message to a specified recipient.
     *
     * @param recipient the recipient's email address
     * @param subject   the subject line of the email
     * @param htmlBody  the HTML content of the email body
     * @throws MessagingException if an error occurs while sending the email
     */
    void sendMessage(String recipient, String subject, String htmlBody) throws MessagingException;

    /**
     * Sends a password reset notification email containing a newly generated password.
     *
     * @param name              the recipient's name
     * @param email             the recipient's email address
     * @param generatedPassword the generated password to include in the message
     * @param lang              the language of the email
     * @throws MessagingException if an error occurs while sending the email
     */
    void sendGeneratedPasswordEmail(String name, String email, String generatedPassword, Language lang) throws MessagingException;

    /**
     * Sends a registration confirmation email to a newly created user.
     *
     * @param name  the recipient's name
     * @param email the recipient's email address
     * @throws MessagingException if an error occurs while sending the email
     */
    void sendRegisterConfirmationEmail(String name, String email) throws MessagingException;

    /**
     * Sends a changed password confirmation email to a newly created user.
     *
     * @param name the recipient's name
     * @param email the recipient's email address
     * @param lang the language of the email
     * @throws MessagingException if an error occurs while sending the email
     */
    void sendChangedPasswordConfirmationEmail(String name, String email, Language lang) throws MessagingException;
}
