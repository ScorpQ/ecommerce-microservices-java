package com.n11.productServive.service;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
    String upload(MultipartFile file);
}
