package vn.homestay.room;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomBlockRepository extends JpaRepository<RoomBlock, Long> {
    boolean existsByRoomId(Long roomId);
    List<RoomBlock> findByRoomIdAndEndDateGreaterThanEqual(Long roomId, LocalDate date);

    @Query("select b from RoomBlock b where b.room.id = :roomId and b.startDate < :endExclusive and b.endDate >= :start")
    List<RoomBlock> findOverlapping(@Param("roomId") Long roomId, @Param("start") LocalDate start,
                                    @Param("endExclusive") LocalDate endExclusive);
}
