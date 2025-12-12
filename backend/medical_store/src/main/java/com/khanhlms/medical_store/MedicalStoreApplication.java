package com.khanhlms.medical_store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling 
public class MedicalStoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedicalStoreApplication.class, args);
	}

}
