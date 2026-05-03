package com.n11.order_service.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Getter
@Entity
@Table(name = "order_details")
public class OrderDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
    private String firstName;
    private String lastName;
    private String streetAddress;
    private String city;
    private String country;
    private String phone;
    private String email;

    public void setId(Long id) { this.id = id; }

    public void setOrder(Order order) { this.order = order; }

    public void setFirstName(String firstName) { this.firstName = firstName; }

    public void setLastName(String lastName) { this.lastName = lastName; }

    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public void setCity(String city) { this.city = city; }

    public void setCountry(String country) { this.country = country; }

    public void setPhone(String phone) { this.phone = phone; }

    public void setEmail(String email) { this.email = email; }
}