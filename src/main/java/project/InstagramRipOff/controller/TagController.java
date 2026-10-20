package project.InstagramRipOff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import project.InstagramRipOff.entity.Tag;
import project.InstagramRipOff.service.TagService;
import project.InstagramRipOff.service.PostService;
import project.InstagramRipOff.entity.Post;

import java.util.List;

@RestController
@RequestMapping("/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @Autowired
    private PostService postService;

    @GetMapping
    @ResponseBody
    public List<Tag> getAllTags(){
        return this.tagService.getAllTags();
    }

    @GetMapping("/{id}")
    @ResponseBody
    public Tag getTagById(@PathVariable Long id) {
        return this.tagService.getTagById(id);
    }

    @GetMapping("/{id}/posts")
    @ResponseBody
    public List<Post> getPostsByTag(@PathVariable Long id) {
        return this.tagService.getPostsByTag(id);
    }

    @PostMapping
    @ResponseBody
    public Tag insertTag(@RequestBody Tag tag){
        return this.tagService.addTag(tag);
    }

    @PutMapping("/{id}")
    @ResponseBody
    public Tag updateTag(@PathVariable Long id, @RequestBody Tag tag){
        tag.setId(id);
        return this.tagService.addTag(tag);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public String deleteById(@PathVariable Long id){
        return this.tagService.deleteTagById(id);
    }
}
