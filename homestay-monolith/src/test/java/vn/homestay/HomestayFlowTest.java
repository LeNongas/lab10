package vn.homestay;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:homestaytest;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.upload-dir=target/test-uploads"
})
@AutoConfigureMockMvc
class HomestayFlowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String login(String username, String password) throws Exception {
        String body = json.writeValueAsString(new Login(username, password));
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("token").asText();
    }

    record Login(String username, String password) {}

    private void configurePayment(String admin) throws Exception {
        mvc.perform(put("/api/admin/payment-settings").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"depositPercent\":30,\"bankName\":\"Ngân hàng kiểm thử\",\"accountNumber\":\"001234567890\",\"accountHolder\":\"NEST HOMESTAY\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.configured").value(true));
    }

    @Test
    void guestCanRegisterAndCannotChooseAdminRole() throws Exception {
        String response = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"newguest\",\"password\":\"securepass123\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andReturn().getResponse().getContentAsString();
        String token = json.readTree(response).get("token").asText();
        mvc.perform(get("/api/bookings/my").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        login("newguest", "securepass123");

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"NEWGUEST\",\"password\":\"securepass123\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"guest2\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void categoryRoomBookingAndApiKeyFlow() throws Exception {
        String admin = login("admin", "admin123");
        String customer = login("guest1", "guest12345");
        mvc.perform(get("/api/admin/payment-settings").header("Authorization", "Bearer " + customer))
                .andExpect(status().isForbidden());
        configurePayment(admin);

        String categoryResponse = mvc.perform(post("/api/categories")
                .header("Authorization", "Bearer " + admin).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Phòng thử nghiệm\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long categoryId = json.readTree(categoryResponse).get("id").asLong();
        String roomBody = "{\"name\":\"Phòng kiểm thử\",\"maxGuests\":2,\"quantity\":1," +
                "\"pricePerNight\":500000,\"description\":\"Yên tĩnh\",\"categoryId\":" + categoryId + "}";
        String roomResponse = mvc.perform(post("/api/rooms").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content(roomBody))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long roomId = json.readTree(roomResponse).get("id").asLong();

        MockMultipartFile image = new MockMultipartFile("file", "room.png", "image/png", new byte[] {1, 2, 3});
        String uploadResponse = mvc.perform(multipart("/api/rooms/" + roomId + "/upload-image")
                .file(image).header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        mvc.perform(get(json.readTree(uploadResponse).get("imageUrl").asText())).andExpect(status().isOk());

        mvc.perform(get("/api/rooms").param("keyword", "kiểm thử").param("sort", "pricePerNight,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/rooms").param("keyword", "kiểm thử").param("guests", "3"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/rooms").param("keyword", "kiểm thử").param("guests", "2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));

        LocalDate in = LocalDate.now().plusDays(2);
        LocalDate out = in.plusDays(2);
        String bookingBody = json.writeValueAsString(new BookingRequest(roomId, in, out, 2));
        String bookingResponse = mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content(bookingBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
                .andExpect(jsonPath("$.guestFullName").value("Nguyễn Văn Khách"))
                .andExpect(jsonPath("$.guestPhone").value("0901234567"))
                .andExpect(jsonPath("$.checkInNote").value("Đến sau 14 giờ"))
                .andExpect(jsonPath("$.depositAmount").value(300000))
                .andExpect(jsonPath("$.depositPercent").value(30))
                .andExpect(jsonPath("$.transferReference").exists())
                .andReturn().getResponse().getContentAsString();
        long bookingId = json.readTree(bookingResponse).get("id").asLong();
        mvc.perform(get("/api/bookings/admin").header("Authorization", "Bearer " + customer))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/bookings/admin").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerName").value("guest1"))
                .andExpect(jsonPath("$[0].roomName").value("Phòng kiểm thử"))
                .andExpect(jsonPath("$[0].guestFullName").value("Nguyễn Văn Khách"))
                .andExpect(jsonPath("$[0].guestPhone").value("0901234567"))
                .andExpect(jsonPath("$[0].pricePerNight").value(500000))
                .andExpect(jsonPath("$[0].totalPrice").value(1000000));
        mvc.perform(get("/api/bookings/my").header("Authorization", "Bearer " + customer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].totalPrice").value(1000000));
        mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content(bookingBody))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new BookingRequest(roomId, in, out, 2,
                        "Nguyễn Văn Khách", "abc", ""))))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/bookings/admin/" + bookingId + "/confirm")
                .header("Authorization", "Bearer " + admin)).andExpect(status().isBadRequest());
        mvc.perform(put("/api/bookings/" + bookingId + "/payment-method")
                .header("Authorization", "Bearer " + customer).contentType(MediaType.APPLICATION_JSON)
                .content("{\"method\":\"BANK_TRANSFER_DEPOSIT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentMethod").value("BANK_TRANSFER_DEPOSIT"))
                .andExpect(jsonPath("$.bankName").value("Ngân hàng kiểm thử"))
                .andExpect(jsonPath("$.bankAccountNumber").value("001234567890"))
                .andExpect(jsonPath("$.bankAccountHolder").value("NEST HOMESTAY"))
                .andExpect(jsonPath("$.transferReference").value("NEST" + bookingId));
        mvc.perform(put("/api/admin/payment-settings").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"depositPercent\":50,\"bankName\":\"Ngân hàng mới\",\"accountNumber\":\"009999999999\",\"accountHolder\":\"NEST HOMESTAY\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/bookings/" + bookingId + "/payment-method")
                .header("Authorization", "Bearer " + customer).contentType(MediaType.APPLICATION_JSON)
                .content("{\"method\":\"BANK_TRANSFER_DEPOSIT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.depositAmount").value(300000))
                .andExpect(jsonPath("$.bankAccountNumber").value("001234567890"));
        mvc.perform(put("/api/bookings/admin/" + bookingId + "/payment")
                .header("Authorization", "Bearer " + customer).contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"PAID\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/bookings/admin/" + bookingId + "/payment")
                .header("Authorization", "Bearer " + admin).contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"DEPOSIT_PAID\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("DEPOSIT_PAID"));
        mvc.perform(put("/api/bookings/admin/" + bookingId + "/confirm")
                .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
        mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + admin))
                .andExpect(status().isForbidden());
        String notificationsResponse = mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + customer))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].bookingId").value(bookingId))
                .andExpect(jsonPath("$[0].readAt").isEmpty())
                .andReturn().getResponse().getContentAsString();
        long notificationId = json.readTree(notificationsResponse).get(0).get("id").asLong();
        String otherGuestResponse = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"notificationsguest\",\"password\":\"securepass123\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String otherGuest = json.readTree(otherGuestResponse).get("token").asText();
        mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + otherGuest))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mvc.perform(put("/api/notifications/" + notificationId + "/read")
                .header("Authorization", "Bearer " + otherGuest))
                .andExpect(status().isNotFound());
        mvc.perform(put("/api/notifications/" + notificationId + "/read")
                .header("Authorization", "Bearer " + customer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.readAt").isNotEmpty());
        mvc.perform(delete("/api/bookings/" + bookingId).header("Authorization", "Bearer " + customer))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content(bookingBody))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/rooms").param("checkIn", in.toString()).param("checkOut", out.toString())
                .param("keyword", "Phòng kiểm thử").param("guests", "2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));

        String nextRoom = "{\"name\":\"Phòng kiểm thử thứ hai\",\"maxGuests\":2,\"quantity\":1," +
                "\"pricePerNight\":500000,\"categoryId\":" + categoryId + "}";
        String nextRoomResponse = mvc.perform(post("/api/rooms").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content(nextRoom))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long secondRoomId = json.readTree(nextRoomResponse).get("id").asLong();
        mvc.perform(get("/api/rooms").param("roomId", String.valueOf(secondRoomId))
                .param("keyword", "không trùng tên").param("size", "1").param("sort", "id,asc")
                .param("checkIn", in.toString()).param("checkOut", out.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(secondRoomId));
        mvc.perform(get("/api/rooms").param("keyword", "Phòng kiểm thử")
                .param("checkIn", in.toString()).param("checkOut", out.toString())
                .param("guests", "2").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(secondRoomId));
        String secondRoomBookingBody = json.writeValueAsString(new BookingRequest(secondRoomId, in, out, 2));
        String secondBooking = mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content(secondRoomBookingBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();
        long secondId = json.readTree(secondBooking).get("id").asLong();
        mvc.perform(put("/api/bookings/" + secondId + "/payment-method")
                .header("Authorization", "Bearer " + customer).contentType(MediaType.APPLICATION_JSON)
                .content("{\"method\":\"PAY_AT_CHECKIN\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/bookings/admin/" + secondId + "/payment")
                .header("Authorization", "Bearer " + admin).contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"DEPOSIT_PAID\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(delete("/api/bookings/" + secondId).header("Authorization", "Bearer " + customer))
                .andExpect(status().isNoContent());

        String keyResponse = mvc.perform(post("/api/api-keys").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ownerName\":\"Đối tác\",\"scopes\":\"rooms:read\",\"validDays\":7}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode key = json.readTree(keyResponse);
        mvc.perform(get("/api/partner/rooms").header("X-API-KEY", key.get("keyValue").asText()))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/api-keys/" + key.get("id").asLong())
                .header("Authorization", "Bearer " + admin)).andExpect(status().isNoContent());
        mvc.perform(get("/api/partner/rooms").header("X-API-KEY", key.get("keyValue").asText()))
                .andExpect(status().isUnauthorized());
    }

    record BookingRequest(long roomId, LocalDate checkIn, LocalDate checkOut, int guests,
                          String guestFullName, String guestPhone, String checkInNote) {
        BookingRequest(long roomId, LocalDate checkIn, LocalDate checkOut, int guests) {
            this(roomId, checkIn, checkOut, guests, "Nguyễn Văn Khách", "0901234567", "Đến sau 14 giờ");
        }
    }

    @Test
    void adjacentReservationsShareTwoRoomInventoryWithoutFalseConflict() throws Exception {
        String admin = login("admin", "admin123");
        String customer = login("guest1", "guest12345");
        String categoryResponse = mvc.perform(post("/api/categories").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Loại thử lịch\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long categoryId = json.readTree(categoryResponse).get("id").asLong();
        mvc.perform(put("/api/categories/" + categoryId).header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Loại đã đổi tên\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Loại đã đổi tên"));
        String roomResponse = mvc.perform(post("/api/rooms").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Phòng thử lịch\",\"maxGuests\":2,\"quantity\":2,\"pricePerNight\":400000,\"categoryId\":" + categoryId + "}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long roomId = json.readTree(roomResponse).get("id").asLong();
        LocalDate start = LocalDate.now().plusDays(20);
        LocalDate middle = start.plusDays(2);
        LocalDate end = middle.plusDays(2);
        for (LocalDate[] stay : new LocalDate[][] {{start, middle}, {middle, end}, {start, end}}) {
            mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(new BookingRequest(roomId, stay[0], stay[1], 1))))
                    .andExpect(status().isCreated());
        }
        mvc.perform(get("/api/rooms").param("keyword", "Phòng thử lịch")
                .param("checkIn", start.toString()).param("checkOut", end.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new BookingRequest(roomId, start, end, 1))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminCanManageGuestAndDeletedTokensStopWorking() throws Exception {
        String admin = login("admin", "admin123");
        String created = mvc.perform(post("/api/users").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"managedguest\",\"password\":\"guestpass123\",\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = json.readTree(created).get("id").asLong();
        String token = login("managedguest", "guestpass123");
        mvc.perform(put("/api/users/" + id).header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"managedguest\",\"password\":\"\",\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/users/" + id).header("Authorization", "Bearer " + admin))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/bookings/my").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void maintenanceBlocksReduceAvailabilityAndCannotOverlapConfirmedCapacity() throws Exception {
        String admin = login("admin", "admin123");
        String customer = login("guest1", "guest12345");
        String categoryResponse = mvc.perform(post("/api/categories").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Loại bảo trì\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long categoryId = json.readTree(categoryResponse).get("id").asLong();
        String roomResponse = mvc.perform(post("/api/rooms").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Phòng bảo trì\",\"maxGuests\":2,\"quantity\":2,\"pricePerNight\":400000,\"categoryId\":" + categoryId + "}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long roomId = json.readTree(roomResponse).get("id").asLong();
        LocalDate start = LocalDate.now().plusDays(40);
        LocalDate end = start.plusDays(2);
        String blockBody = "{\"roomId\":" + roomId + ",\"startDate\":\"" + start + "\",\"endDate\":\"" + end
                + "\",\"units\":1,\"reason\":\"Sửa máy lạnh\"}";
        mvc.perform(post("/api/admin/calendar/blocks").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content(blockBody)).andExpect(status().isForbidden());
        String blockResponse = mvc.perform(post("/api/admin/calendar/blocks").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content(blockBody))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long blockId = json.readTree(blockResponse).get("id").asLong();
        mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new BookingRequest(roomId, start, end.plusDays(1), 1))))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new BookingRequest(roomId, start, end.plusDays(1), 1))))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/calendar/blocks").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content(blockBody)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/rooms").param("keyword", "Phòng bảo trì")
                .param("checkIn", start.toString()).param("checkOut", end.plusDays(1).toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/admin/calendar").param("month", start.toString().substring(0, 7))
                .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.blocks[0].reason").value("Sửa máy lạnh"));
        mvc.perform(delete("/api/admin/calendar/blocks/" + blockId).header("Authorization", "Bearer " + admin))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/rooms").param("keyword", "Phòng bảo trì")
                .param("checkIn", start.toString()).param("checkOut", end.plusDays(1).toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].availableForStay").value(1));
    }

    @Test
    void adminRejectionAndCancellationShowReasonAndReleaseRoom() throws Exception {
        String admin = login("admin", "admin123");
        String customer = login("guest1", "guest12345");
        configurePayment(admin);
        String categoryResponse = mvc.perform(post("/api/categories").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Loại xét duyệt\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long categoryId = json.readTree(categoryResponse).get("id").asLong();
        String roomResponse = mvc.perform(post("/api/rooms").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Phòng xét duyệt\",\"maxGuests\":2,\"quantity\":1,\"pricePerNight\":400000,\"categoryId\":" + categoryId + "}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long roomId = json.readTree(roomResponse).get("id").asLong();
        LocalDate in = LocalDate.now().plusDays(60);
        LocalDate out = in.plusDays(2);
        String bookingBody = json.writeValueAsString(new BookingRequest(roomId, in, out, 1));
        String firstResponse = mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content(bookingBody))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long firstId = json.readTree(firstResponse).get("id").asLong();
        String rejectUrl = "/api/bookings/admin/" + firstId + "/reject";
        mvc.perform(put(rejectUrl).header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"Không thể đón khách\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(put(rejectUrl).header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"   \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put(rejectUrl).header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"  Phòng cần sửa chữa  \"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.statusReason").value("Phòng cần sửa chữa"));
        mvc.perform(put("/api/bookings/admin/" + firstId + "/confirm").header("Authorization", "Bearer " + admin))
                .andExpect(status().isBadRequest());
        String secondResponse = mvc.perform(post("/api/bookings").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content(bookingBody))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long secondId = json.readTree(secondResponse).get("id").asLong();
        mvc.perform(put("/api/bookings/" + secondId + "/payment-method").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"BANK_TRANSFER_DEPOSIT\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/bookings/admin/" + secondId + "/payment").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"DEPOSIT_PAID\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/bookings/admin/" + secondId + "/confirm").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk());
        mvc.perform(put("/api/bookings/admin/" + secondId + "/cancel").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"Sửa điện khẩn cấp\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.statusReason").value("Sửa điện khẩn cấp"))
                .andExpect(jsonPath("$.paymentStatus").value("REFUND_PENDING"));
        mvc.perform(get("/api/bookings/my").header("Authorization", "Bearer " + customer))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].statusReason").value("Sửa điện khẩn cấp"));
        mvc.perform(put("/api/bookings/admin/" + secondId + "/payment").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"REFUNDED\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.paymentStatus").value("REFUNDED"));
        mvc.perform(get("/api/rooms").param("keyword", "Phòng xét duyệt")
                .param("checkIn", in.toString()).param("checkOut", out.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].availableForStay").value(1));
    }
}
