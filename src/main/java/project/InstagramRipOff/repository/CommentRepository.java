package project.InstagramRipOff.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.InstagramRipOff.entity.Comment;

@Repository
public interface CommentRepository extends
        JpaRepository<Comment,Long> {

    int countByUser_Id(Long userId);
}
