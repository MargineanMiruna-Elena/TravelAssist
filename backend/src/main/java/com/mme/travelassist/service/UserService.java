package com.mme.travelassist.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mme.travelassist.dto.user.ChangePasswordDTO;
import com.mme.travelassist.exception.auth.InvalidPasswordException;
import com.mme.travelassist.exception.user.DuplicateUserException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.model.User;
import com.mme.travelassist.model.UserPreferences;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

public interface UserService {

    /**
     * Retrieves a user by their unique identifier.
     *
     * @param id the unique identifier of the user
     * @return the user entity if found
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    User getUserById(UUID id) throws UserNotFoundException;

    /**
     * Retrieves user preferences by their unique identifier.
     *
     * @param id the unique identifier of the user
     * @return the user preferences entity if found
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    UserPreferences getUserPreferencesByUserId(UUID id) throws UserNotFoundException;

    /**
     * Retrieves a user by their email address.
     *
     * @param email the email of the user
     * @return an {@code Optional} containing the user if found, or empty if not
     * @throws UserNotFoundException if the user with the given email does not exist
     */
    User getUserByEmail(String email) throws UserNotFoundException;

    /**
     * Patches an existing user in the repository by their email.
     * This method allows partial updates to the user entity.
     *
     * @param user the user containing new values
     * @return the patched user entity
     * @throws UserNotFoundException if the user with the given email does not exist
     * @throws DuplicateUserException if a user with the same email already exists
     */
    User patchUser(User user) throws UserNotFoundException, DuplicateUserException;

    /**
     * Patches an existing user preferences in the repository by their user id.
     * This method allows partial updates to the user preferences entity.
     *
     * @param userPreferences the user preferences containing new values
     * @return the patched user preferences entity
     * @throws UserNotFoundException if the user with the given id does not exist
     */
    UserPreferences patchUserPreferences(UserPreferences userPreferences) throws UserNotFoundException;

    /**
     * Changes the password of an existing user by their user id.
     *
     * @param id the id of the user
     * @param oldPassword the old password to be replaced
     * @param newPassword the new password to be saved
     * @throws UserNotFoundException if the user with the given id does not exist
     * @throws InvalidPasswordException if the old password does not match the one in the database
     */
    void changePassword(UUID id, String oldPassword, String newPassword) throws UserNotFoundException, InvalidPasswordException, MessagingException;

    /**
     * Retrieves a user by their unique identifier.
     *
     * @param id the unique identifier of the user
     */
    void deleteUser(UUID id) throws UserNotFoundException;
}
