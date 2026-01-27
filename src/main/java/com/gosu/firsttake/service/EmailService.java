package com.gosu.firsttake.service;

public interface EmailService {
    void sendVerificationEmail(String to, String link);
    void sendPasswordResetEmail(String to, String link);
}
