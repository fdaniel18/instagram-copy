package project.InstagramRipOff.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.InstagramRipOff.entity.Vote;

public interface VoteRepository extends JpaRepository<Vote, Long> {
}
