package project.InstagramRipOff.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.Date;



@MappedSuperclass
public abstract class GeneralPost {


    @Column(columnDefinition = "text", nullable = false)
    private String text;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date dateTime = new Date();

    @Column(name = "picture_url")
    private String pictureUrl;

    public GeneralPost() {
    }

    public GeneralPost(String text, Date dateTime, String pictureUrl) {
        this.text = text;
        this.dateTime = dateTime;
        this.pictureUrl = pictureUrl;
    }

    public GeneralPost(String text, String pictureUrl) {
        this.text = text;
        this.pictureUrl = pictureUrl;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Date getDateTime() {
        return dateTime;
    }

    public void setDateTime(Date dateTime) {
        this.dateTime = dateTime;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }
}
