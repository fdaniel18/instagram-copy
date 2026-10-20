package project.InstagramRipOff.util;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TwilioSmsSender{

    private final TwilioConfig twilioConfig;
    private final boolean enabled;

    @Autowired
    public TwilioSmsSender(TwilioConfig twilioConfig) {
        this.twilioConfig = twilioConfig;
        // SMS notifications are optional: only initialise Twilio when credentials are configured
        this.enabled = isSet(twilioConfig.getAccountSid()) && isSet(twilioConfig.getAuthToken());
        if (enabled) {
            Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());
        }
    }

    public void sendSms(String toPhoneNumber, String messageBody) {
        if (!enabled) {
            System.out.println("Twilio not configured, skipping SMS to " + toPhoneNumber);
            return;
        }

        Message.creator(
                new com.twilio.type.PhoneNumber(toPhoneNumber),
                new com.twilio.type.PhoneNumber(twilioConfig.getPhoneNumber()),
                messageBody
        ).create();

        System.out.println("SMS sent successfully!");
    }

    private static boolean isSet(String value) {
        return value != null && !value.isBlank();
    }

}
