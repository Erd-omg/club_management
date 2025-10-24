package com.club.management.controller;

import com.club.management.common.Result;
import com.club.management.entity.ActivityAttachment;
import com.club.management.service.ActivityAttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 活动附件控制器
 */
@RestController
@RequestMapping("/activity/{activityId}/attachment")
public class ActivityAttachmentController {

    @Autowired
    private ActivityAttachmentService attachmentService;

    /**
     * 上传附件
     */
    @PostMapping("/upload")
    public Result<List<ActivityAttachment>> upload(
            @PathVariable Long activityId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(required = false) String description,
            @RequestAttribute("currentUser") Object currentUser
    ) {
        return attachmentService.uploadAttachments(activityId, files, description, currentUser);
    }

    /**
     * 获取附件列表
     */
    @GetMapping("/list")
    public Result<List<ActivityAttachment>> list(
            @PathVariable Long activityId,
            @RequestAttribute("currentUser") Object currentUser
    ) {
        return attachmentService.getAttachmentList(activityId, currentUser);
    }

    /**
     * 下载附件
     */
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long activityId,
            @PathVariable Long attachmentId,
            @RequestAttribute("currentUser") Object currentUser
    ) {
        return attachmentService.downloadAttachment(attachmentId, currentUser);
    }

    /**
     * 预览附件
     */
    @GetMapping("/{attachmentId}/preview")
    public ResponseEntity<Resource> preview(
            @PathVariable Long activityId,
            @PathVariable Long attachmentId,
            @RequestAttribute("currentUser") Object currentUser
    ) {
        return attachmentService.previewAttachment(attachmentId, currentUser);
    }

    /**
     * 删除附件
     */
    @DeleteMapping("/{attachmentId}")
    public Result<String> delete(
            @PathVariable Long activityId,
            @PathVariable Long attachmentId,
            @RequestAttribute("currentUser") Object currentUser
    ) {
        return attachmentService.deleteAttachment(attachmentId, currentUser);
    }

    /**
     * 更新附件信息
     */
    @PutMapping("/{attachmentId}")
    public Result<String> update(
            @PathVariable Long activityId,
            @PathVariable Long attachmentId,
            @RequestBody ActivityAttachment attachment,
            @RequestAttribute("currentUser") Object currentUser
    ) {
        return attachmentService.updateAttachment(attachmentId, attachment, currentUser);
    }
}

