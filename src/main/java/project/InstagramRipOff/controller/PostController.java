package project.InstagramRipOff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.InstagramRipOff.config.JwtService;
import project.InstagramRipOff.entity.Post;
import project.InstagramRipOff.entity.Comment;
import project.InstagramRipOff.service.PostService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    @ResponseBody
    public List<Post> retrieveAllPosts() {
        return this.postService.retrieveAllPosts();
    }

    @GetMapping("/{id}")
    @ResponseBody
    public Post getPostById(@PathVariable Long id) {
        return this.postService.getPostById(id);
    }
    @GetMapping("/{id}/detail")
    @ResponseBody
    public Post getPostDetailById(@PathVariable Long id) {
        // This endpoint returns a post with all its comments and other details
        return this.postService.getPostDetailById(id);
    }

    @GetMapping("/{id}/comments")
    @ResponseBody
    public List<Comment> getPostComments(@PathVariable Long id) {
        return this.postService.getPostComments(id);
    }

    @PostMapping
    @ResponseBody
    public Post addPost(@RequestBody Post post, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);

        return this.postService.addPost(post, username);
    }

    @PutMapping("/{id}")
    @ResponseBody
    public Post updatePost(@PathVariable Long id, @RequestBody Post post, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        post.setId(id);
        return this.postService.updatePost(post, username);
    }

    @PutMapping("/{id}/comments")
    @ResponseBody
    public Post togglePostComments(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        boolean stopComments = request.get("stopComments");
        return this.postService.togglePostComments(id, stopComments);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public String deleteById(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        return this.postService.deletePostById(id, username);
    }

    @GetMapping("/filterByTag")
    @ResponseBody
    public List<Post> filterByTag(@RequestParam String tagName) {
        return this.postService.filterByTag(tagName);
    }

    @GetMapping("/filterByTitle")
    @ResponseBody
    public List<Post> filterByTitle(@RequestParam String title) {
        return this.postService.filterByTitle(title);
    }

    @GetMapping("/filterByUser")
    @ResponseBody
    public List<Post> filterByUser(@RequestParam String username) {
        return this.postService.filterByUser(username);
    }
}
