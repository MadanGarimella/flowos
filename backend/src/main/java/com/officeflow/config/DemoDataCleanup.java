package com.officeflow.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataCleanup implements CommandLineRunner {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        entityManager.createNativeQuery("""
                delete from activity_log
                where task_id in (
                    select id from task
                    where project_id in (
                        select id from project
                        where owner_id in (select id from users where email like '%@officeflow.local')
                    )
                    or reporter_id in (select id from users where email like '%@officeflow.local')
                    or assignee_id in (select id from users where email like '%@officeflow.local')
                )
                """).executeUpdate();
        entityManager.createNativeQuery("""
                delete from task_comment
                where task_id in (
                    select id from task
                    where project_id in (
                        select id from project
                        where owner_id in (select id from users where email like '%@officeflow.local')
                    )
                    or reporter_id in (select id from users where email like '%@officeflow.local')
                    or assignee_id in (select id from users where email like '%@officeflow.local')
                )
                or author_id in (select id from users where email like '%@officeflow.local')
                """).executeUpdate();
        entityManager.createNativeQuery("""
                delete from task
                where project_id in (
                    select id from project
                    where owner_id in (select id from users where email like '%@officeflow.local')
                )
                or reporter_id in (select id from users where email like '%@officeflow.local')
                or assignee_id in (select id from users where email like '%@officeflow.local')
                """).executeUpdate();
        entityManager.createNativeQuery("""
                delete from project_member
                where project_id in (
                    select id from project
                    where owner_id in (select id from users where email like '%@officeflow.local')
                )
                or user_id in (select id from users where email like '%@officeflow.local')
                """).executeUpdate();
        entityManager.createNativeQuery("""
                delete from project
                where owner_id in (select id from users where email like '%@officeflow.local')
                """).executeUpdate();
        entityManager.createNativeQuery("""
                delete from users
                where email like '%@officeflow.local'
                """).executeUpdate();
    }
}

