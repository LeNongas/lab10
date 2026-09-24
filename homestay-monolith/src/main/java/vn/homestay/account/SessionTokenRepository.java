package vn.homestay.account;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionTokenRepository extends JpaRepository<SessionToken, String> {
    void deleteByUserId(Long userId);
}
