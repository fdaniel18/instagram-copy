package project.InstagramRipOff.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @OneToMany(mappedBy = "tag", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"tag"})
    private List<PostTag> postsTag;

    public Tag() {
    }

    public Tag(String name) {
        this.name = name;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<PostTag> getPostsTag() {
        return postsTag;
    }

    public void addPostTag(PostTag postTag) {
        postsTag.add(postTag);
    }

    public void setPostsTag(List<PostTag> postsTag) {
        this.postsTag = postsTag;
    }
}
