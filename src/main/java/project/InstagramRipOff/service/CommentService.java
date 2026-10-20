package project.InstagramRipOff.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.InstagramRipOff.entity.Comment;
import project.InstagramRipOff.entity.Post;
import project.InstagramRipOff.entity.Status;
import project.InstagramRipOff.entity.User;
import project.InstagramRipOff.repository.CommentRepository;
import project.InstagramRipOff.repository.PostRepository;
import project.InstagramRipOff.repository.UserRepository;
import project.InstagramRipOff.entity.Role;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Comment> retrieveAllComments()
    {
        return (List<Comment>) this.commentRepository.findAll();
    }
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
    }

    public Comment addCommentToPost(Long postId, Comment comment) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        if (post.isStopComments()) {
            throw new RuntimeException("Comments are disabled for this post.");
        }

        comment.setPost(post);
        Comment savedComment = commentRepository.save(comment);

        // After saving, fetch the comment again to ensure user details are loaded
        Comment fetchedComment = commentRepository.findById(savedComment.getId())
            .orElseThrow(() -> new RuntimeException("Saved comment not found"));

        // După salvare, verificăm dacă e primul comentariu
        if (post.getComments().size() == 1 && post.getStatus() == Status.Just_Posted) {
            post.setStatus(Status.First_Reactions);
            postRepository.save(post);
        }

        return fetchedComment;
    }

    public Comment addComment(Comment comment)
    {
        return this.commentRepository.save(comment);
    }

    public Comment updateComment(Long id, Comment updatedComment, String username) {
        try {
            Comment existingComment = commentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is the comment author or admin
            if (existingComment.getUser().getId().equals(user.getId()) || user.getRole().equals(Role.ADMIN)) {
                // Update allowed fields
                existingComment.setText(updatedComment.getText());
                existingComment.setPictureUrl(updatedComment.getPictureUrl());
                
                // Explicitly set the post to ensure the relationship is maintained
                existingComment.setPost(existingComment.getPost());

                Comment savedComment = commentRepository.save(existingComment);

                // Fetch the comment again to ensure user details are loaded in the response
                 Comment fetchedComment = commentRepository.findById(savedComment.getId())
                    .orElseThrow(() -> new RuntimeException("Updated comment not found after saving"));
                
                return fetchedComment;
            } else {        throw new RuntimeException("You don't have permission to edit this comment.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update comment: " + e.getMessage());
        }
    }

    public String deleteCommentById(Long id, String username)
    {
        try{
            Comment comment = commentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is the comment author, post author, or admin
            if (comment.getUser().getId().equals(user.getId()) || 
                comment.getPost().getUser().getId().equals(user.getId()) ||
                user.getRole().equals(Role.ADMIN))
            {
                this.commentRepository.deleteById(id);
                return "Comment deleted successfully! ";
            }
            else
            {
                throw new RuntimeException("You don't have permission to delete this comment.");
            }
        }
        catch (Exception e)
        {
            // Log the exception for debugging
            e.printStackTrace();
            return "Comment with id: " + id + "couldn't be deleted: " + e.getMessage();
        }
    }
}
