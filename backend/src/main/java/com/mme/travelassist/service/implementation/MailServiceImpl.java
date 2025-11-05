package com.mme.travelassist.service.implementation;

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
    public void sendGeneratedPasswordEmail(String recipient, String generatedPassword) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable(recipientName, recipient);
        thymeleafContext.setVariable("generatedPassword", generatedPassword);
        String htmlBody = templateEngine.process("generatedPasswordEmail.html", thymeleafContext);
        mailSubject = "Your Generated Password";

        sendMessage(recipient, mailSubject, htmlBody);
    }
}
