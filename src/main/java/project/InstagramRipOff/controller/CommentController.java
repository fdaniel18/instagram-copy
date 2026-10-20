package project.InstagramRipOff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import project.InstagramRipOff.entity.Comment;
import project.InstagramRipOff.service.CommentService;
import project.InstagramRipOff.config.JwtService;

import java.util.List;

@RestController
@RequestMapping("/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {

    @Autowired
    private CommentService commentService;
    @Autowired
    private JwtService jwtService;

    @GetMapping
    @ResponseBody
    public List<Comment> getAllComments(){
        return this.commentService.retrieveAllComments();
    }

    @GetMapping("/{id}")
    @ResponseBody
    public Comment getCommentById(@PathVariable Long id) {
        return this.commentService.getCommentById(id);
    }

    @PostMapping
    @ResponseBody
    public Comment insertComment(@RequestBody Comment comment){
        return this.commentService.addComment(comment);
    }

    @PostMapping("/posts/{postId}")
    @ResponseBody
    public Comment createCommentForPost(@PathVariable Long postId, @RequestBody Comment comment) {
        return this.commentService.addCommentToPost(postId, comment);
    }

    @PutMapping("/{id}")
    @ResponseBody
    public Comment updateComment(@PathVariable Long id, @RequestBody Comment comment, @RequestHeader("Authorization") String authHeader){
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        return this.commentService.updateComment(id, comment, username);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public String deleteById(@PathVariable Long id, @RequestHeader("Authorization") String authHeader){
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        return this.commentService.deleteCommentById(id, username);
    }
}
