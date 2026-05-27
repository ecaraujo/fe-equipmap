package br.com.equipmap.brigadier.domain;

import br.com.equipmap.core.messaging.MessageChannel;
import br.com.equipmap.core.messaging.MessageDeliveryResult;
import br.com.equipmap.core.messaging.MessageDeliveryStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_logs")
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false)
    private UUID brigadierId;

    @Column(nullable = false, length = 160)
    private String recipientName;

    @Column(nullable = false, length = 160)
    private String destination;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MessageChannel channel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationStatus status = NotificationStatus.QUEUED;

    @Column(length = 120)
    private String providerMessageId;

    @Column(length = 80)
    private String errorCode;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant sentAt;

    protected NotificationLog() {
    }

    public NotificationLog(UUID condominiumId, Brigadier brigadier, MessageChannel channel, String message) {
        this.condominiumId = condominiumId;
        this.brigadierId = brigadier.getId();
        this.recipientName = brigadier.getName();
        this.destination = brigadier.getPhone();
        this.channel = channel;
        this.message = message;
    }

    public void applyDelivery(MessageDeliveryResult result) {
        attempts++;
        providerMessageId = result.providerMessageId();
        errorCode = result.errorCode();
        errorMessage = result.errorMessage();
        sentAt = result.sentAt();
        status = result.status() == MessageDeliveryStatus.FAILED ? NotificationStatus.FAILED : NotificationStatus.SENT;
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public UUID getBrigadierId() { return brigadierId; }
    public String getRecipientName() { return recipientName; }
    public String getDestination() { return destination; }
    public MessageChannel getChannel() { return channel; }
    public String getMessage() { return message; }
    public NotificationStatus getStatus() { return status; }
    public String getProviderMessageId() { return providerMessageId; }
    public String getErrorCode() { return errorCode; }
    public String getErrorMessage() { return errorMessage; }
    public int getAttempts() { return attempts; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getSentAt() { return sentAt; }
}
