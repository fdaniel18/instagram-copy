package project.InstagramRipOff.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.InstagramRipOff.entity.Post;
import project.InstagramRipOff.entity.PostTag;
import project.InstagramRipOff.entity.Tag;
import project.InstagramRipOff.repository.TagRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    public List<Tag> getAllTags()
    {
        return this.tagRepository.findAll();
    }

    public Tag getTagById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));
    }

    public Tag addTag(Tag tag)
    {
       return this.tagRepository.save(tag);
    }

    public String deleteTagById(Long id)
    {
        try{
            this.tagRepository.deleteById(id);
            return "Tag deleted successfully!";
        }
        catch (Exception e)
        {
            return "Tag with id: " + id + "couldn't be deleted!";
        }
    }
    public List<Post> getPostsByTag(Long tagId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + tagId));

        List<PostTag> postTags = tag.getPostsTag();
        List<Post> result = new ArrayList<>();

        for (PostTag postTag : postTags) {
            if (postTag.getPost() != null) {
                result.add(postTag.getPost());
            }
        }

        return result;
    }

}
