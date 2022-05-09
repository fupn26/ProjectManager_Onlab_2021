package com.example.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class RabbitMqConfig {

    @Bean
    public Queue projectQueue() {
        return new Queue("project_queue");
    }

    @Bean
    public Queue emailQueue() {
        return new Queue("email_queue");
    }
}
