package project.InstagramRipOff.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.InstagramRipOff.entity.Post;
import project.InstagramRipOff.entity.PostTag;
import project.InstagramRipOff.entity.Tag;
import project.InstagramRipOff.repository.PostRepository;
import project.InstagramRipOff.repository.PostTagRepository;
import project.InstagramRipOff.repository.TagRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PostTagService {

    @Autowired
    private PostTagRepository postTagRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private TagRepository tagRepository;

    public PostTag addTagToPost(Long postId, String tagName) {
        Optional<Post> post = postRepository.findById(postId);
        Optional<Tag> tag = tagRepository.findByName(tagName);

        if (post.isPresent()) {

            if (tag.isPresent()) {

                PostTag postTag = new PostTag();
                postTag.setPost(post.get());
                postTag.setTag(tag.get());
                return postTagRepository.save(postTag);
            } else {
                PostTag postTag = new PostTag();
                postTag.setPost(post.get());
                Tag newTag = new Tag(tagName);
                tagRepository.save(newTag);
                postTag.setTag(newTag);
                return postTagRepository.save(postTag);
            }
        }
        else throw new RuntimeException("Post Not found");
    }


    public List<PostTag> getAllPostTags() {
        return postTagRepository.findAll();
    }

    public String deletePostTagById(Long id) {
        if (postTagRepository.existsById(id)) {
            postTagRepository.deleteById(id);
            return "Asocierea Post-Tag cu ID-ul " + id + " a fost ștearsă.";
        } else {
            return "Nu există nicio asociere Post-Tag cu ID-ul " + id;
        }
    }
}
