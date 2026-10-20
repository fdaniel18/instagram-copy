package project.InstagramRipOff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.InstagramRipOff.entity.PostTag;
import project.InstagramRipOff.service.PostTagService;

import java.util.List;

@RestController
@RequestMapping("/postTags")
public class PostTagController {

    @Autowired
    private PostTagService postTagService;

    @PostMapping("/addTagToPost")
    public ResponseEntity<PostTag> addTagToPost(@RequestParam Long postId, @RequestParam String tagName) {
        PostTag postTag = postTagService.addTagToPost(postId, tagName);
        return ResponseEntity.ok(postTag);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<PostTag>> getAllPostTags() {
        List<PostTag> postTags = postTagService.getAllPostTags();
        return ResponseEntity.ok(postTags);
    }

    @DeleteMapping("/deleteById")
    public ResponseEntity<String> deletePostTagById(@RequestParam Long id) {
        String response = postTagService.deletePostTagById(id);
        return ResponseEntity.ok(response);
    }
}
