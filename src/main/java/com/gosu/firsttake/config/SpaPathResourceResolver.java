package com.gosu.firsttake.config;

import org.springframework.core.io.Resource;
import org.springframework.lang.Nullable;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

class SpaPathResourceResolver extends PathResourceResolver {

    @Override
    @Nullable
    protected Resource getResource(String resourcePath, Resource location) throws IOException {
        Resource resource = super.getResource(resourcePath, location);
        if (resource != null && resource.exists()) {
            return resource;
        }

        if (hasFileExtension(resourcePath)) {
            return null;
        }

        Resource nestedIndex = super.getResource(ensureTrailingSlash(resourcePath) + "index.html", location);
        if (nestedIndex != null && nestedIndex.exists()) {
            return nestedIndex;
        }

        return super.getResource("index.html", location);
    }

    private boolean hasFileExtension(@Nullable String resourcePath) {
        return StringUtils.hasText(resourcePath) && resourcePath.contains(".");
    }

    private String ensureTrailingSlash(@Nullable String resourcePath) {
        if (!StringUtils.hasText(resourcePath)) {
            return "";
        }
        return resourcePath.endsWith("/") ? resourcePath : resourcePath + "/";
    }
}
