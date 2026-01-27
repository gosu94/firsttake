package com.gosu.firsttake;

import com.gosu.firsttake.config.SecurityProperties;
import com.gosu.firsttake.config.SendGridProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({SecurityProperties.class, SendGridProperties.class})
public class FirsttakeApplication {

	public static void main(String[] args) {
		SpringApplication.run(FirsttakeApplication.class, args);
	}

}
