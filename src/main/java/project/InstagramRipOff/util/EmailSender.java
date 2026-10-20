package project.InstagramRipOff.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSender {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;


    public void sendEmail(String toEmail,String subject,String body)
    {
        // e-mail notifications are optional: skip them when no account is configured
        if (fromAddress.isBlank()) {
            System.out.println("Mail not configured, skipping e-mail to " + toEmail);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        javaMailSender.send(message);

        System.out.println("Mail sent successfully!");

    }
}
