package org.example.scoremicroservice.model;

public class ScoreUpdatePayload {
    private double scoreChange;

    public ScoreUpdatePayload() {}

    public ScoreUpdatePayload(double scoreChange) {
        this.scoreChange = scoreChange;
    }

    public double getScoreChange() {
        return scoreChange;
    }

    public void setScoreChange(double scoreChange) {
        this.scoreChange = scoreChange;
    }
}