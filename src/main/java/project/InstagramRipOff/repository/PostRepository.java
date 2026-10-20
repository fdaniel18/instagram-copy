package project.InstagramRipOff.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.InstagramRipOff.entity.Post;

import java.util.List;

@Repository
public interface PostRepository extends
        JpaRepository<Post,Long> {

    List<Post>findAllByUser_IdOrderByDateTimeDesc(Long user_id);
    List<Post> findAllByOrderByDateTimeDesc();
    List<Post> findByTitleContainingIgnoreCaseOrderByDateTimeDesc(String title);

    int countByUser_Id(Long userId);
}
