package project.InstagramRipOff.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.InstagramRipOff.entity.Comment;
import project.InstagramRipOff.entity.Post;
import project.InstagramRipOff.entity.User;
import project.InstagramRipOff.entity.Vote;
import project.InstagramRipOff.repository.CommentRepository;
import project.InstagramRipOff.repository.PostRepository;
import project.InstagramRipOff.repository.UserRepository;
import project.InstagramRipOff.repository.VoteRepository;
import project.InstagramRipOff.model.EntityType;
import project.InstagramRipOff.model.ScoreUpdateRequest;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;

@Service
public class VoteService {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Value("${scoring-service.url}")
    private String scoringServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Vote> retrieveAllVotes()
    {
        return this.voteRepository.findAll();
    }

    public Vote addVote(Vote vote)
    {
        return this.voteRepository.save(vote);
    }

    public String deleteVoteById(Long id)
    {
        try {
            // Get the vote before deleting it to know its type and owner
            Vote vote = voteRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Vote not found with id: " + id));

            // Store the vote information before deleting
            Long userId = vote.getPost() != null ? vote.getPost().getUser().getId() : vote.getComment().getUser().getId();
            EntityType entityType = vote.getPost() != null ? EntityType.POST : EntityType.COMMENT;
            int previousVoteType = vote.getVote_type(); // Store the previous vote type
            Long actioningUserId = vote.getUser().getId();

            // Delete the vote
            voteRepository.deleteById(id);

            // Log details before calling scoring service
            System.out.println("Main Backend - deleteVoteById: Preparing to call scoring service for vote deletion.");
            System.out.println("  Vote ID being deleted: " + id);
            System.out.println("  Owner User ID: " + userId);
            System.out.println("  Entity Type: " + entityType);
            System.out.println("  Vote Type (sent to scoring service): 0 (indicating removal)");
            System.out.println("  Previous Vote Type: " + previousVoteType);
            System.out.println("  Actioning User ID (voter): " + actioningUserId);

            // Call scoring service to update scores with voteType = 0 to indicate removal
            callScoringService(userId, entityType, 0, actioningUserId, previousVoteType);

            return "Vote deleted successfully!";
        }
        catch (Exception e)
        {
            return "Vote with id: " + id + " couldn't be deleted!";
        }
    }

    public List<Vote> getUserVotes(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return user.getVotes();
    }

    public Vote voteOnPost(Long postId, String username, Integer voteValue) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Long userId = user.getId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        if (post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot vote on your own post");
        }

        Optional<Vote> existingVote = post.getVotes().stream()
                .filter(v -> v.getUser().getId().equals(userId))
                .findFirst();

        Vote savedVote;
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            vote.setVote_type(voteValue);
            savedVote = voteRepository.save(vote);
        } else {
            Vote vote = new Vote(user, post, voteValue);
            savedVote = voteRepository.save(vote);
        }

        callScoringService(post.getUser().getId(), EntityType.POST, voteValue, userId);

        return savedVote;
    }

    public Vote voteOnComment(Long commentId, String username, Integer voteValue) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Long userId = user.getId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        if (comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot vote on your own comment");
        }

        Optional<Vote> existingVote = comment.getVotes().stream()
                .filter(v -> v.getUser().getId().equals(userId))
                .findFirst();

        Vote savedVote;
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            vote.setVote_type(voteValue);
            savedVote = voteRepository.save(vote);
        } else {
            Vote vote = new Vote(user, comment, voteValue);
            savedVote = voteRepository.save(vote);
        }

        callScoringService(comment.getUser().getId(), EntityType.COMMENT, voteValue, userId);

        return savedVote;
    }

    private void callScoringService(Long userId, EntityType entityType, int voteType, Long actioningUserId) {
        callScoringService(userId, entityType, voteType, actioningUserId, voteType);
    }

    private void callScoringService(Long userId, EntityType entityType, int voteType, Long actioningUserId, int previousVoteType) {
        String url = scoringServiceUrl + "/score/update";
        ScoreUpdateRequest request = new ScoreUpdateRequest(userId, entityType, voteType, actioningUserId);
        request.setPreviousVoteType(previousVoteType);

        System.out.println("Main Backend: Preparing to send ScoreUpdateRequest to scoring service:");
        System.out.println("  User ID (owner): " + request.getUserId());
        System.out.println("  Entity Type: " + request.getEntityType());
        System.out.println("  Vote Type: " + request.getVoteType());
        System.out.println("  Previous Vote Type: " + request.getPreviousVoteType());
        System.out.println("  Actioning User ID (voter): " + request.getActioningUserId());
        System.out.println("  Target URL: " + url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        HttpEntity<ScoreUpdateRequest> httpEntity = new HttpEntity<>(request, headers);

        try {
            restTemplate.postForEntity(url, httpEntity, String.class);
            System.out.println("Main Backend: Sent vote event to scoring service for user: " + userId);
        } catch (Exception e) {
            System.err.println("Main Backend: Failed to call scoring service: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public int getVoteCountForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return post.getVotes().stream()
                .mapToInt(Vote::getVote_type)
                .sum();
    }

    public int getVoteCountForComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        return comment.getVotes().stream()
                .mapToInt(Vote::getVote_type)
                .sum();
    }

    public List<Comment> getSortedCommentsByVotes(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Comment> comments = post.getComments();
        comments.sort((c1, c2) -> {
            int v1 = c1.getVotes().stream().mapToInt(Vote::getVote_type).sum();
            int v2 = c2.getVotes().stream().mapToInt(Vote::getVote_type).sum();
            return Integer.compare(v2, v1);
        });

        return comments;
    }

}
