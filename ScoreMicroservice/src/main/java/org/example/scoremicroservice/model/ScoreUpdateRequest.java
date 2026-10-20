package org.example.scoremicroservice.model;

public class ScoreUpdateRequest {
    private Long userId; // The ID of the user whose score needs updating (owner of post/comment)
    private EntityType entityType; // POST or COMMENT
    private int voteType; // +1 for upvote, -1 for downvote
    private Long actioningUserId; // The ID of the user who performed the vote
    private int previousVoteType; // Track the previous vote type for vote removal

    // Constructors, getters, and setters
    public ScoreUpdateRequest() {}

    public ScoreUpdateRequest(Long userId, EntityType entityType, int voteType, Long actioningUserId) {
        this.userId = userId;
        this.entityType = entityType;
        this.voteType = voteType;
        this.actioningUserId = actioningUserId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public int getVoteType() {
        return voteType;
    }

    public void setVoteType(int voteType) {
        this.voteType = voteType;
    }

    public Long getActioningUserId() {
        return actioningUserId;
    }

    public void setActioningUserId(Long actioningUserId) {
        this.actioningUserId = actioningUserId;
    }

    public int getPreviousVoteType() {
        return previousVoteType;
    }

    public void setPreviousVoteType(int previousVoteType) {
        this.previousVoteType = previousVoteType;
    }
}