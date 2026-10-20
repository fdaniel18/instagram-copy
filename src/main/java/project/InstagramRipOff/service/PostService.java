package project.InstagramRipOff.service;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.InstagramRipOff.entity.*;
import project.InstagramRipOff.repository.CommentRepository;
import project.InstagramRipOff.repository.PostRepository;
import project.InstagramRipOff.repository.TagRepository;
import project.InstagramRipOff.repository.UserRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PostTagService postTagService;
    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private CommentRepository commentRepository;

    public List<Post> retrieveAllPosts() {
        List<Post> posts = this.postRepository.findAllByOrderByDateTimeDesc();
        // Ensure votes and user are loaded for each post
        for (Post post : posts) {
            if (post.getVotes() != null) {
                Hibernate.initialize(post.getVotes());
            }
            // Explicitly fetch the user to ensure their score is loaded
             if (post.getUser() != null && post.getUser().getId() != null) {
                User user = userRepository.findById(post.getUser().getId())
                                      .orElseThrow(() -> new RuntimeException("User not found for post with id: " + post.getId()));
                post.setUser(user);
            }
        }
        return posts;
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }
    public Post getPostDetailById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        // Ensure comments are loaded
        Hibernate.initialize(post.getComments());

        // Sort comments by date (newest first)
        post.getComments().sort(Comparator.comparing(Comment::getDateTime).reversed());

        // Ensure votes are loaded
        Hibernate.initialize(post.getVotes());

        // Ensure tags are loaded
        Hibernate.initialize(post.getPostTags());

        // Explicitly fetch the user to ensure their score is loaded
        if (post.getUser() != null && post.getUser().getId() != null) {
            User user = userRepository.findById(post.getUser().getId())
                                  .orElseThrow(() -> new RuntimeException("User not found for post with id: " + id));
            post.setUser(user);
        }

        return post;
    }

    public List<Comment> getPostComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        List<Comment> comments = post.getComments();

        // Sort comments by date (newest first)
        comments.sort(Comparator.comparing(Comment::getDateTime).reversed());

        return comments;
    }
    public Post togglePostComments(Long postId, boolean stopComments) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        post.setStopComments(stopComments);

        if (stopComments) {
            post.setStatus(Status.Outdated);
        } else {
            // When re-enabling comments, set status based on comment count
            if (post.getComments().isEmpty()) {
                post.setStatus(Status.Just_Posted);
            } else {
                post.setStatus(Status.First_Reactions);
            }
        }
        return postRepository.save(post);
    }

    public Post addPost(Post post, String username) {
        if (username == null) {
            throw new RuntimeException("User is required for creating a post.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        post.setUser(user);
        Post savedPost = postRepository.save(post);

        // Process postTags from the incoming request
        if (post.getPostTags() != null) {
            for (PostTag postTag : post.getPostTags()) {
                // The frontend sends tag ID, we need to get the tag name to use addTagToPost
                if (postTag.getTag() != null && postTag.getTag().getId() != null) {
                    Tag tag = tagRepository.findById(postTag.getTag().getId())
                                     .orElseThrow(() -> new RuntimeException("Tag not found with id: " + postTag.getTag().getId()));
                    postTagService.addTagToPost(savedPost.getId(), tag.getName());
                } else if (postTag.getTag() != null && postTag.getTag().getName() != null) {
                     // If somehow name is sent directly
                    postTagService.addTagToPost(savedPost.getId(), postTag.getTag().getName());
                }
            }
        }

        // Also extract and process hashtags from the post text
        List<String> tagNamesFromText = extractHashtags(post.getText());
        for (String tagName : tagNamesFromText) {
             postTagService.addTagToPost(savedPost.getId(), tagName);
        }

        // Ensure postTags and associated Tags are loaded before returning
        Hibernate.initialize(savedPost.getPostTags());
        for (PostTag pt : savedPost.getPostTags()) {
            Hibernate.initialize(pt.getTag());
        }

        return postRepository.findById(savedPost.getId())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve saved post after adding tags"));
    }

    public String deletePostById(Long id, String username) {

        if (username == null) {
            throw new RuntimeException("User is required for creating a post.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(post.getUser().getUsername().equals(username) || user.getRole().equals(Role.ADMIN))
        {
            try {
                this.postRepository.deleteById(id);
                return "Post deleted successfully!";
            } catch (Exception e) {
                return "The post with id:" + id + "couldn't be deleted!";
            }
        }

        else
            return "You don't have permission to delete this post!";
    }


    public Post updatePost(Post post, String username) {
        if(post == null) {
            throw new RuntimeException("Post doesn't exist.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!post.getUser().getUsername().equals(username) && !user.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("You don't have the permission to edit this!.");
        }

        // Get the existing post to preserve relationships
        Post existingPost = postRepository.findById(post.getId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Update the fields that can be changed
        existingPost.setTitle(post.getTitle());
        existingPost.setText(post.getText());
        existingPost.setPictureUrl(post.getPictureUrl());
        existingPost.setStopComments(post.isStopComments());
        existingPost.setStatus(post.getStatus());

        // Save the updated post
        Post savedPost = postRepository.save(existingPost);

        // Process postTags from the incoming request
        if (post.getPostTags() != null) {
            // Clear existing tags
            existingPost.getPostTags().clear();
            postRepository.save(existingPost);

            // Add new tags
            for (PostTag postTag : post.getPostTags()) {
                if (postTag.getTag() != null && postTag.getTag().getId() != null) {
                    Tag tag = tagRepository.findById(postTag.getTag().getId())
                            .orElseThrow(() -> new RuntimeException("Tag not found with id: " + postTag.getTag().getId()));
                    
                    // Check if the tag is already associated with the post
                    boolean tagExists = existingPost.getPostTags().stream()
                            .anyMatch(pt -> pt.getTag().getName().equals(tag.getName()));
                    
                    if (!tagExists) {
                        postTagService.addTagToPost(savedPost.getId(), tag.getName());
                    }
                } else if (postTag.getTag() != null && postTag.getTag().getName() != null) {
                    // Check if the tag is already associated with the post
                    boolean tagExists = existingPost.getPostTags().stream()
                            .anyMatch(pt -> pt.getTag().getName().equals(postTag.getTag().getName()));
                    
                    if (!tagExists) {
                        postTagService.addTagToPost(savedPost.getId(), postTag.getTag().getName());
                    }
                }
            }
        }

        // Also extract and process hashtags from the post text
        List<String> tagNamesFromText = extractHashtags(post.getText());
        for (String tagName : tagNamesFromText) {
            // Check if the tag is already associated with the post
            boolean tagExists = existingPost.getPostTags().stream()
                    .anyMatch(pt -> pt.getTag().getName().equals(tagName));
            
            if (!tagExists) {
                postTagService.addTagToPost(savedPost.getId(), tagName);
            }
        }

        // Ensure postTags and associated Tags are loaded before returning
        Hibernate.initialize(savedPost.getPostTags());
        for (PostTag pt : savedPost.getPostTags()) {
            Hibernate.initialize(pt.getTag());
        }

        return postRepository.findById(savedPost.getId())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve saved post after adding tags"));
    }


    public static List<String> extractHashtags(String text) {
        List<String> hashtags = new ArrayList<>();
        Pattern pattern = Pattern.compile("#\\S+(?=\\s|$)");
        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {
            String word = matcher.group();
            hashtags.add(word.substring(1));
        }

        return hashtags;
    }

    public List<Post> filterByTag(String tagName)
    {

        Tag tag = tagRepository.findByName(tagName)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        List <PostTag> postTags = tag.getPostsTag();

        List<Post> posts = retrieveAllPosts();
        List<Post> result = new ArrayList<>();
        for(Post post : posts)
        {
            for(PostTag postTag : postTags)
            {
                if(post.getPostTags().contains(postTag))
                {
                    result.add(post);
                }
            }
        }
        return result;
    }

    public List<Post> filterByTitle(String title) {

       return this.postRepository.findByTitleContainingIgnoreCaseOrderByDateTimeDesc(title);
    }

    public List<Post> filterByUser(String username) {
        if (username == null) {
            throw new RuntimeException("User is required for creating a post.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return postRepository.findAllByUser_IdOrderByDateTimeDesc(user.getId());
    }


}