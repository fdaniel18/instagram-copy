package project.InstagramRipOff.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class PostTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnoreProperties({"postTags", "title", "text", "pictureUrl", "dateTime", "status", "stopComments", "user", "comments", "votes"})
    private Post post;

    @ManyToOne
    @JoinColumn(name = "tag_id")
    @JsonIgnoreProperties({"postsTag"})
    private Tag tag;
    

    public PostTag() {
    }

    public PostTag(Post post, Tag tag) {
        this.post = post;
        this.tag = tag;
    }

    public PostTag(Tag tag) {
        this.tag = tag;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
    }
}
