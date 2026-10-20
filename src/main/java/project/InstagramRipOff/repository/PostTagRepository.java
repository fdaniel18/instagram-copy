package project.InstagramRipOff.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.InstagramRipOff.entity.Post;
import project.InstagramRipOff.entity.PostTag;
import project.InstagramRipOff.entity.Tag;

import java.util.Optional;

@Repository
public interface PostTagRepository extends JpaRepository<PostTag,Long> {
}
