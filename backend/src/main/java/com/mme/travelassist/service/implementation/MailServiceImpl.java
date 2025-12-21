package com.mme.travelassist.service.implementation;

import com.mme.travelassist.model.enums.Language;
import com.mme.travelassist.service.MailService;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class MailServiceImpl implements MailService {

    private final String recipientName = "recipientName";
    private String mailSubject;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendMessage(String recipient, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    @Override
    public void sendGeneratedPasswordEmail(String name, String email, String generatedPassword, Language lang) throws MessagingException {
        Context thymeleafContext = new Context();

        String subject = switch (lang) {
            case Language.ro -> "Confirmare Resetare Parolă";
            case Language.de -> "Bestätigung der Passwort-Zurücksetzung";
            default -> "Password Reset Notification";
        };
        String templateName = "passwordChangeConfirmationEmail_" + lang + ".html";

        thymeleafContext.setVariable(recipientName, name);
        thymeleafContext.setVariable("generatedPassword", generatedPassword);
        String htmlBody = templateEngine.process(templateName, thymeleafContext);
        mailSubject = subject;

        sendMessage(email, mailSubject, htmlBody);
    }

    @Override
    public void sendRegisterConfirmationEmail(String name, String email) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable(recipientName, name);
        thymeleafContext.setVariable("recipientEmail", email);
        String htmlBody = templateEngine.process("registerConfirmationEmail.html", thymeleafContext);
        mailSubject = "Register Confirmation Notification";

        sendMessage(email, mailSubject, htmlBody);
    }

    @Override
    public void sendChangedPasswordConfirmationEmail(String name, String email, Language lang) throws MessagingException {
        Context thymeleafContext = new Context();

        String subject = switch (lang) {
            case Language.ro -> "Confirmare Schimbare Parolă";
            case Language.de -> "Bestätigung der Passwortänderung";
            default -> "Password Change Notification";
        };
        String templateName = "passwordChangeConfirmationEmail_" + lang + ".html";

        thymeleafContext.setVariable(recipientName, name);
        thymeleafContext.setVariable("recipientEmail", email);
        String htmlBody = templateEngine.process(templateName, thymeleafContext);
        mailSubject = subject;

        sendMessage(email, mailSubject, htmlBody);
    }
}
