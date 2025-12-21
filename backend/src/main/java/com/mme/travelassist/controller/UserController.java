package com.mme.travelassist.controller;

import com.mme.travelassist.dto.user.*;
import com.mme.travelassist.exception.auth.InvalidPasswordException;
import com.mme.travelassist.exception.user.DuplicateUserException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.mapper.UserMapper;
import com.mme.travelassist.mapper.UserPreferencesMapper;
import com.mme.travelassist.model.User;
import com.mme.travelassist.model.UserPreferences;
import com.mme.travelassist.security.JwtUtils;
import com.mme.travelassist.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final UserPreferencesMapper userPreferencesMapper;
    private final JwtUtils jwtUtils;

    /**
     * Retrieves a user by their ID.
     * @param id the UUID of the user to retrieve
     * @return ResponseEntity containing UserResponseDTO if found, or 404 Not Found if not
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id) throws UserNotFoundException {
        User user = userService.getUserById(id);
        UserResponseDTO response = userMapper.userToUserResponseDTO(user);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves a user preferences by user ID.
     * @param id the UUID of the user to retrieve
     * @return ResponseEntity containing UserPreferencesResponseDTO if found, or 404 Not Found if not
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    @GetMapping("/preferences/{id}")
    public ResponseEntity<UserPreferencesResponseDTO> getUserPreferencesById(@PathVariable UUID id) throws UserNotFoundException {
        UserPreferences userPreferences = userService.getUserPreferencesByUserId(id);
        UserPreferencesResponseDTO response = userPreferencesMapper.userPreferencesToUserPreferencesResponseDTO(userPreferences);
        return ResponseEntity.ok(response);
    }

    /**
     * Partially updates an existing user.
     * @param id the UUID of the user to patch
     * @param userDTO the UserDTO containing updated user details
     * @return ResponseEntity containing the patched UserResponseDTO
     * @throws UserNotFoundException if the user with the given ID does not exist
     * @throws DuplicateUserException if a user with the same email already exists
     */
    @PatchMapping("/{id}")
    public ResponseEntity<UpdateUserResponseDTO> patchUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) throws UserNotFoundException, DuplicateUserException {
        User userToPatch = userMapper.userDTOToUser(userDTO);
        userToPatch.setId(id);
        User patchedUser = userService.patchUser(userToPatch);
        UpdateUserResponseDTO response = userMapper.userToUpdateUserResponseDTO(patchedUser);
        String token = jwtUtils.generateToken(patchedUser.getId(), patchedUser.getEmail(), patchedUser.getUsername());
        response.setJwt(token);
        return ResponseEntity.ok(response);
    }

    /**
     * Partially updates an existing user's preferences.
     * @param id the UUID of the user preferences to patch
     * @param userPreferencesDTO the UserPreferencesDTO containing updated user details
     * @return ResponseEntity containing the patched UserPreferencesResponseDTO
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    @PatchMapping("/preferences/{id}")
    public ResponseEntity<UserPreferencesResponseDTO> patchUserPreferences(@PathVariable UUID id, @Valid @RequestBody UserPreferencesDTO userPreferencesDTO) throws UserNotFoundException {
        UserPreferences userPreferences = userPreferencesMapper.userPreferencesDTOToUserPreferences(userPreferencesDTO);
        User user = userService.getUserById(id);
        userPreferences.setUser(user);
        UserPreferences patchedUserPreferences = userService.patchUserPreferences(userPreferences);
        UserPreferencesResponseDTO response = userPreferencesMapper.userPreferencesToUserPreferencesResponseDTO(patchedUserPreferences);
        return ResponseEntity.ok(response);
    }

    /**
     * Changes a user's password.
     * @param id the UUID of the user to delete
     * @param changePasswordDTO the old and new passwords of the user
     * @return ResponseEntity with no content if change is successful
     * @throws UserNotFoundException if the user with the given ID does not exist
     * @throws InvalidPasswordException if the old password does not match the one in the database
     */
    @PatchMapping("/change-password/{id}")
    public ResponseEntity<Void> changePassword(@PathVariable UUID id, @Valid @RequestBody ChangePasswordDTO changePasswordDTO) throws UserNotFoundException, DuplicateUserException, InvalidPasswordException, MessagingException {
        userService.changePassword(id, changePasswordDTO.getOldPassword(), changePasswordDTO.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    /**
     * Deletes a user by their ID.
     * @param id the UUID of the user to delete
     * @return ResponseEntity with no content if deletion is successful
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) throws UserNotFoundException {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
