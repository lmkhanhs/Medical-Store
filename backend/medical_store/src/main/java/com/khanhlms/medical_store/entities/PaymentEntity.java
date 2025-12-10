package com.khanhlms.medical_store.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "payments")
public class PaymentEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String paymentMethod;
    String status;
    String transactionId;
    @Column(columnDefinition = "TEXT")
    String paymentNote;
    String code;
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    OrderEntity order;
}
