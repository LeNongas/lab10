package vn.homestay.room;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomCategoryRepository extends JpaRepository<RoomCategory, Long> {
    java.util.Optional<RoomCategory> findByNameIgnoreCase(String name);
}
