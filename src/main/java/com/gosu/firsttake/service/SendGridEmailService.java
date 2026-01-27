package com.gosu.firsttake.service;

import com.gosu.firsttake.config.SendGridProperties;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SendGridEmailService implements EmailService {
    private final SendGridProperties properties;

    public SendGridEmailService(SendGridProperties properties) {
        this.properties = properties;
    }

    @Override
    public void sendVerificationEmail(String to, String link) {
        String subject = "Verify your FirstTake account";
        String html = "<p>Welcome to FirstTake!</p><p>Please verify your email: "
            + "<a href=\"" + link + "\">Verify Email</a></p>";
        sendEmail(to, subject, html, properties.getVerificationTemplate());
    }

    @Override
    public void sendPasswordResetEmail(String to, String link) {
        String subject = "Reset your FirstTake password";
        String html = "<p>Reset your password using the link below:</p>"
            + "<p><a href=\"" + link + "\">Reset Password</a></p>";
        sendEmail(to, subject, html, properties.getResetTemplate());
    }

    private void sendEmail(String to, String subject, String html, String templateId) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            log.info("[Email:DEV] To={} Subject={} LinkBody={}", to, subject, html);
            return;
        }
        try {
            Email from = new Email(properties.getFromEmail());
            Email toEmail = new Email(to);
            Content content = new Content("text/html", html);
            Mail mail = new Mail(from, subject, toEmail, content);
            if (templateId != null && !templateId.isBlank()) {
                mail.setTemplateId(templateId);
            }
            SendGrid sg = new SendGrid(properties.getApiKey());
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            if (response.getStatusCode() >= 400) {
                log.warn("SendGrid error status={} body={}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception ex) {
            log.warn("SendGrid send failed", ex);
        }
    }
}
