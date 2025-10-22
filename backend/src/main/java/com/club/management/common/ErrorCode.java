package com.club.management.common;

/**
 * 错误码常量
 */
public class ErrorCode {

    /**
     * 成功
     */
    public static final Integer SUCCESS = 200;

    /**
     * 学号已存在
     */
    public static final Integer STUDENT_ID_EXISTS = 4001;

    /**
     * 活动已审批通过，不可修改
     */
    public static final Integer ACTIVITY_APPROVED = 4002;

    /**
     * 部门下仍有成员
     */
    public static final Integer DEPT_HAS_MEMBERS = 4003;

    /**
     * 未登录或token过期
     */
    public static final Integer UNAUTHORIZED = 401;

    /**
     * 权限不足
     */
    public static final Integer FORBIDDEN = 403;

    /**
     * 资源不存在
     */
    public static final Integer NOT_FOUND = 404;

    /**
     * 请求参数错误
     */
    public static final Integer BAD_REQUEST = 400;

    /**
     * 系统异常
     */
    public static final Integer SYSTEM_ERROR = 500;
}

