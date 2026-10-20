package project.InstagramRipOff.entity;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;

@Entity
@Table(name = "votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "post_id"}),
        @UniqueConstraint(columnNames = {"user_id", "comment_id"})
        })
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id", nullable=false)
    @JsonIgnoreProperties({"posts", "comments", "votes", "password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "email", "name", "phone_number", "isBanned", "score"})
    private User user;

    @ManyToOne
    @JoinColumn(name="post_id", nullable=true)
    @JsonIgnoreProperties({"votes", "comments", "user", "postTags", "title", "text", "pictureUrl", "dateTime", "status", "stopComments"})
    private Post post;

    @ManyToOne
    @JoinColumn(name="comment_id", nullable=true)
    @JsonIgnoreProperties({"votes", "post", "user", "text", "pictureUrl", "dateTime"})
    private Comment comment;

    @Column(name = "vote_type")
    private Integer vote_type;


    public Vote() {
    }

    public Vote(User user, Comment comment, Integer vote_type) {
        this.user = user;
        this.comment = comment;
        this.vote_type = vote_type;
    }
    public Vote(User user, Post post, Integer vote_type) {
        this.user = user;
        this.post = post;
        this.vote_type = vote_type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public Integer getVote_type() {
        return vote_type;
    }

    public void setVote_type(Integer vote_type) {
        this.vote_type = vote_type;
    }

}
