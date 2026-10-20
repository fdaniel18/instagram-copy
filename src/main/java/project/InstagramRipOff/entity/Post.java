    package project.InstagramRipOff.entity;

    import com.fasterxml.jackson.annotation.*;
    import jakarta.persistence.*;

    import java.util.ArrayList;
    import java.util.List;

    @Entity
    @Table(name = "posts")
    public class Post extends GeneralPost {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String title;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Status status = Status.Just_Posted;

        @Column(name = "stop_comments", columnDefinition = "boolean default false")
        private boolean stopComments=false;

        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false)
        @JsonIgnoreProperties({"posts", "comments", "votes", "password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "email", "name", "phone_number", "isBanned"/*, "score"*/})
        private User user;

        @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonIgnoreProperties({"post", "user", "text", "pictureUrl", "dateTime"})
        private List<Comment> comments=new ArrayList<>();

        @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonIgnoreProperties({"post", "comment"})
        private List<Vote> votes= new ArrayList<>();

        @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
        @JsonIgnoreProperties({"post"})
        private List<PostTag> postTags=new ArrayList<>();

        public Post() {
        }

        public Post(Long id, String title, Status status) {
            this.title = title;
            this.status = status;
        }

        public Post(String text, User user, String pictureUrl, String title) {
            super(text, pictureUrl);
            this.title = title;
            this.user = user;
            this.status = Status.Just_Posted;
        }

        public Post(String text, User user, String pictureUrl, String title, List<PostTag> postTags) {
            super(text, pictureUrl);
            this.title = title;
            this.user = user;
            this.status = Status.Just_Posted;
            this.postTags = postTags;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Status getStatus() {
            return status;
        }

        public void setStatus(Status status) {
            this.status = status;
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }

        public List<Comment> getComments() {
            return comments;
        }

        public void setComments(List<Comment> comments) {
            this.comments = comments;
        }

        public List<Vote> getVotes() {
            return votes;
        }

        public void setVotes(List<Vote> votes) {
            this.votes = votes;
        }

        public List<PostTag> getPostTags() {
            return postTags;
        }

        public void setPostTags(List<PostTag> postTags) {
            this.postTags = postTags;
        }

        public boolean isStopComments() {
            return stopComments;
        }

        public void setStopComments(boolean stopComments) {
            this.stopComments = stopComments;
        }
    }
