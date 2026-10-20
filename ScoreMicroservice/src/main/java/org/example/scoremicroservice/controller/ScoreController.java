package org.example.scoremicroservice.controller;

import org.example.scoremicroservice.model.ScoreUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.scoremicroservice.service.ScoreCalculationService;

@RestController
@RequestMapping("/score")
public class ScoreController {

    private final ScoreCalculationService scoreCalculationService;

    @Autowired
    public ScoreController(ScoreCalculationService scoreCalculationService) {
        this.scoreCalculationService = scoreCalculationService;
    }

    @PostMapping("/test")
    public ResponseEntity<String> testEndpoint(@RequestBody java.util.Map<String, Object> payload) {
        System.out.println("Received test request with payload: " + payload);
        return ResponseEntity.ok("Test endpoint received data");
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateScore(@RequestBody ScoreUpdateRequest request) {
        System.out.println("Received score update request: User ID = " + request.getUserId() +
                ", Entity Type = " + request.getEntityType() +
                ", Vote Type = " + request.getVoteType() +
                ", Actioning User ID = " + request.getActioningUserId());

        // Perform score calculation and application in a separate thread
        // to avoid blocking the request thread. This is a simple way
        // to make the API call non-blocking from the perspective of the caller.
        new Thread(() -> {
            try {
                if (request.getVoteType() == 0) {
                    // This is a vote removal, use the previous vote type
                    scoreCalculationService.removeVoteScore(
                            request.getUserId(),
                            request.getEntityType(),
                            request.getPreviousVoteType(),
                            request.getActioningUserId()
                    );
                } else {
                    // This is a new vote or vote change
                    scoreCalculationService.calculateAndApplyScore(
                            request.getUserId(),
                            request.getEntityType(),
                            request.getVoteType(),
                            request.getActioningUserId()
                    );
                }
            } catch (Exception e) {
                System.err.println("Error during asynchronous score calculation: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();

        return ResponseEntity.ok("Score update initiated");
    }
}