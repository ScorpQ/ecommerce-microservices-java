package com.n11.productServive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@EnableDiscoveryClient
@CrossOrigin
public class ProductServiveApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductServiveApplication.class, args);
	}

}
