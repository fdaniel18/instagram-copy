package org.example.scoremicroservice.service;

import org.example.scoremicroservice.model.EntityType;
import org.example.scoremicroservice.model.ScoreUpdatePayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ScoreCalculationService {

    // Configure the URL of your main InstagramRipOff backend
    @Value("${main-app.url}")
    private String mainAppUrl;

    private final RestTemplate restTemplate = new RestTemplate(); // Simple HTTP client

    public void calculateAndApplyScore(Long userId, EntityType entityType, int voteType, Long actioningUserId) {
        double points = 0.0;

        if (entityType == EntityType.POST) {
            if (voteType > 0) { // Upvote
                points = 2.5;
            } else if (voteType < 0) { // Downvote
                points = -1.5;
            } else { // Vote removal (voteType = 0)
                // When removing a vote, we need to know the previous vote type
                // This will be handled by the main app sending the previous vote type
                return; // Skip score update for vote removal
            }
        } else if (entityType == EntityType.COMMENT) {
            if (voteType > 0) { // Upvote
                points = 5.0;
            } else if (voteType < 0) { // Downvote
                points = -2.5;
            } else { // Vote removal (voteType = 0)
                return; // Skip score update for vote removal
            }
        }

        // Rule: They down vote a comment of another user (-1.5 point)
        // This deduction applies to the user performing the downvote, if it's a comment and not their own
        if (entityType == EntityType.COMMENT && voteType < 0 && !userId.equals(actioningUserId)) {
            System.out.println("Comment downvote by user " + actioningUserId + " on user " + userId + "'s comment. Deducting 1.5 points from voter.");
            updateUserScoreInMainApp(actioningUserId, -1.5);
            // The score calculation for the comment owner (userId) is handled below
        }

        // Calculate score change for the owner of the post/comment (userId)
        // We don't multiply by voteType since we already set the correct sign in points
        double ownerScoreChange = points;

        // Only update the owner's score if there's a change based on the defined rules
        if (ownerScoreChange != 0.0) {
            System.out.println("calculateAndApplyScore: Updating score for owner " + userId + " based on " + entityType + " vote. Change: " + ownerScoreChange);
            updateUserScoreInMainApp(userId, ownerScoreChange);
        } else if (entityType == EntityType.COMMENT && voteType < 0 && userId.equals(actioningUserId)){
            // If a user downvotes their own comment, there's no score change for the owner based on the rules
            System.out.println("User " + userId + " downvoted their own comment. No score change for owner based on this vote.");
        }
    }

    public void removeVoteScore(Long userId, EntityType entityType, int previousVoteType, Long actioningUserId) {
        double points = 0.0;

        if (entityType == EntityType.POST) {
            if (previousVoteType > 0) { // Removing upvote
                points = -2.5; // Reverse the upvote points
            } else if (previousVoteType < 0) { // Removing downvote
                points = 1.5; // Reverse the downvote points
            }
        } else if (entityType == EntityType.COMMENT) {
            if (previousVoteType > 0) { // Removing upvote
                points = -5.0; // Reverse the upvote points
            } else if (previousVoteType < 0) { // Removing downvote
                points = 2.5; // Reverse the downvote points
            }
        }

        // If it was a comment downvote by another user, reverse the voter's penalty
        if (entityType == EntityType.COMMENT && previousVoteType < 0 && !userId.equals(actioningUserId)) {
            System.out.println("removeVoteScore: Removing comment downvote by user " + actioningUserId + ". Adding back 1.5 points to voter.");
            updateUserScoreInMainApp(actioningUserId, 1.5);
        }

        // Update the owner's score
        if (points != 0.0) {
            System.out.println("removeVoteScore: Removing vote score for owner " + userId + " based on " + entityType + ". Change: " + points);
            updateUserScoreInMainApp(userId, points);
        }
    }

    private void updateUserScoreInMainApp(Long userId, double scoreChange) {
        // This method calls an endpoint in your main InstagramRipOff backend
        // to update the user's score. We will create this endpoint in the main app next.
        String url = mainAppUrl + "/users/" + userId + "/score/update";
        ScoreUpdatePayload payload = new ScoreUpdatePayload(scoreChange);
        try {
            // Send POST request to the main app's endpoint
            restTemplate.postForEntity(url, payload, String.class);
            System.out.println("Successfully sent score update for user " + userId + ": " + scoreChange);
        } catch (Exception e) {
            System.err.println("Failed to send score update to main app for user " + userId + ": " + e.getMessage());
            // Handle error (e.g., logging, retries)
        }
    }
}