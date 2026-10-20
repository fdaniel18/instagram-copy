package project.InstagramRipOff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import project.InstagramRipOff.entity.Comment;
import project.InstagramRipOff.entity.User;
import project.InstagramRipOff.entity.Vote;
import project.InstagramRipOff.service.VoteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/votes")
@CrossOrigin(origins = "http://localhost:4200")
public class VoteController {

    @Autowired
    private VoteService voteService;

    @GetMapping
    @ResponseBody
    public List<Vote> getAllVotes(){
        return this.voteService.retrieveAllVotes();
    }

    @GetMapping("/user/{userId}")
    @ResponseBody
    public List<Vote> getUserVotes(@PathVariable Long userId) {
        return this.voteService.getUserVotes(userId);
    }

    @PostMapping
    @ResponseBody
    public Vote insertVote(@RequestBody Vote vote){
        return this.voteService.addVote(vote);
    }

    @PostMapping("/posts/{postId}/vote")
    @ResponseBody
    public Vote voteOnPost(@PathVariable Long postId, @RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();

        Object voteValueObj = request.get("voteValue");
        if (voteValueObj == null) {
            throw new RuntimeException("voteValue is missing from request body");
        }
        Integer voteValue = Integer.valueOf(voteValueObj.toString());

        return this.voteService.voteOnPost(postId, username, voteValue);
    }

    @PostMapping("/comments/{commentId}/vote")
    @ResponseBody
    public Vote voteOnComment(@PathVariable Long commentId, @RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();

        Object voteValueObj = request.get("voteValue");
        if (voteValueObj == null) {
            throw new RuntimeException("voteValue is missing from request body");
        }
        Integer voteValue = Integer.valueOf(voteValueObj.toString());

        return this.voteService.voteOnComment(commentId, username, voteValue);
    }


    @PutMapping("/{id}")
    @ResponseBody
    public Vote updateVote(@PathVariable Long id, @RequestBody Vote vote){
        vote.setId(id);
        return this.voteService.addVote(vote);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public Map<String, String> deleteById(@PathVariable Long id){
        String message = this.voteService.deleteVoteById(id);
        return Map.of("message", message);
    }

    @GetMapping("/posts/{postId}/count")
    @ResponseBody
    public int getVoteCountForPost(@PathVariable Long postId) {
        return voteService.getVoteCountForPost(postId);
    }

    @GetMapping("/comments/{commentId}/count")
    @ResponseBody
    public int getVoteCountForComment(@PathVariable Long commentId) {
        return voteService.getVoteCountForComment(commentId);
    }

    @GetMapping("/posts/{postId}/sorted-comments")
    @ResponseBody
    public List<Comment> getSortedComments(@PathVariable Long postId) {
        return voteService.getSortedCommentsByVotes(postId);
    }
}
