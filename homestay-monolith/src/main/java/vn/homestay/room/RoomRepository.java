package vn.homestay.room;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("select r from Room r where (:keyword is null or lower(r.name) like lower(concat('%', :keyword, '%'))) and (:categoryId is null or r.category.id = :categoryId)")
    Page<Room> search(@Param("keyword") String keyword, @Param("categoryId") Long categoryId, Pageable pageable);
    boolean existsByCategoryId(Long categoryId);
    Optional<Room> findByNameIgnoreCase(String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Room r where r.id = :id")
    Optional<Room> findByIdForUpdate(@Param("id") Long id);
}
