package vn.homestay.room;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "room_categories")
@Getter @Setter @NoArgsConstructor
public class RoomCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    @OneToMany(mappedBy = "category")
    private List<Room> rooms = new ArrayList<>();
}
